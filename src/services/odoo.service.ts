// src/services/odoo.service.ts

const ODOO_URL = process.env.ODOO_URL;
const ODOO_DB = process.env.ODOO_DB;
const ODOO_USERNAME = process.env.ODOO_USERNAME;
const ODOO_API_KEY = process.env.ODOO_API_KEY;

/**
 * Fonction générique pour communiquer avec l'API Odoo en JSON-RPC
 */
async function odooCall(model: string, method: string, args: any[], kwargs: any = {}) {
    // 1. Authentification pour récupérer l'identifiant utilisateur (UID)
    const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'common',
                method: 'authenticate',
                args: [ODOO_DB, ODOO_USERNAME, ODOO_API_KEY, {}]
            }
        })
    });
    
    const authData = await authRes.json();
    const uid = authData.result;

    if (!uid) {
        throw new Error("Authentification Odoo échouée. Vérifiez vos variables d'environnement.");
    }

    // 2. Exécution de la commande demandée (Créer client, facture, etc.)
    const execRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [ODOO_DB, uid, ODOO_API_KEY, model, method, args, kwargs]
            }
        })
    });

    const execData = await execRes.json();
    if (execData.error) {
        throw new Error(`Erreur Odoo: ${JSON.stringify(execData.error)}`);
    }
    
    return execData.result;
}

/**
 * Fonction principale appelée après un paiement Stripe
 */
export async function createOdooInvoice(companyName: string, email: string, vatNumber: string | null, amountPaidInCents: number) {
    try {
        console.log(`🚀 Début de la facturation Odoo pour ${companyName}...`);

        // 1. Chercher ou créer le client (res.partner)
        let partnerId;
        const searchPartner = await odooCall('res.partner', 'search', [[['email', '=', email]]]);
        
        if (searchPartner && searchPartner.length > 0) {
            partnerId = searchPartner[0];
        } else {
            partnerId = await odooCall('res.partner', 'create', [{
                name: companyName,
                email: email,
                vat: vatNumber || false,
                is_company: true,
            }]);
        }

        // 2. Chercher ton produit "Abonnement Cardeo SaaS"
        const searchProduct = await odooCall('product.product', 'search', [[['name', '=', 'Abonnement Cardeo SaaS']]]);
        const productId = searchProduct && searchProduct.length > 0 ? searchProduct[0] : null;

        if (!productId) {
            console.error("❌ Produit 'Abonnement Cardeo SaaS' introuvable dans Odoo.");
            return null;
        }

        // 3. Créer la facture (account.move)
        // Le prix vient de Stripe, on le divise par 100 car Stripe compte en centimes (1000 = 10€)
        const price = amountPaidInCents / 100;

        const invoiceId = await odooCall('account.move', 'create', [{
            move_type: 'out_invoice',
            partner_id: partnerId,
            invoice_line_ids: [
                [0, 0, {
                    product_id: productId,
                    quantity: 1,
                    price_unit: price,
                }]
            ]
        }]);

        // 4. Valider la facture (La passer de "Brouillon" à "Comptabilisée")
        //await odooCall('account.move', 'action_post', [[invoiceId]]);

        console.log(`✅ Facture Odoo générée et validée avec succès ! (ID: ${invoiceId})`);
        return invoiceId;

    } catch (error) {
        console.error('❌ Erreur lors de la facturation Odoo:', error);
        return null;
    }
}
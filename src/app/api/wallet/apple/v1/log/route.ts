// src/app/api/wallet/apple/v1/log/route.ts
export async function POST(request: Request) {
    try {
      const body = await request.json();
      console.error("🍏 RAPPORTS D'ERREURS APPLE WALLET :", JSON.stringify(body.logs, null, 2));
      return new Response(null, { status: 200 });
    } catch (error) {
      return new Response(null, { status: 200 });
    }
  }
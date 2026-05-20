<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class OrderController extends Controller
{
    // Retrieve all orders for the authenticated user with pagination support
    #[OA\Get(
        path: "/orders",
        tags: ["Orders"],
        summary: "List all orders for the authenticated user",
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of orders",
                content: new OA\JsonContent(type: "array", items: new OA\Items(ref: "#/components/schemas/Order"))
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    // Retrieve a single order by ID for the authenticated user
    #[OA\Get(
        path: "/orders/{id}",
        tags: ["Orders"],
        summary: "Get a single order by ID",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "Order ID", schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Order detail",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "data", ref: "#/components/schemas/Order"),
                ])
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Order not found"),
        ]
    )]
    public function show(Request $request, $id)
    {
        $order = Order::with('items')->findOrFail($id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => $order,
        ]);
    }

    // Cancel a pending order by ID if it belongs to the authenticated user
    #[OA\Post(
        path: "/orders/{id}/cancel",
        tags: ["Orders"],
        summary: "Cancel a pending order",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "Order ID", schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Order cancelled successfully",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "message", type: "string", example: "Order cancelled successfully"),
                ])
            ),
            new OA\Response(response: 400, description: "Only pending orders can be cancelled"),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Order not found"),
        ]
    )]
    public function cancel(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Only pending orders can be cancelled'], 400);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Order cancelled successfully',
            'data' => $order,
        ]);
    }
}

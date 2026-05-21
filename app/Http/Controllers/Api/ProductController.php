<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ProductController extends Controller
{
    // Retrieve paginated list of active products with optional filtering and search
    #[OA\Get(
        path: "/products",
        tags: ["Products"],
        summary: "List all active products with pagination",
        parameters: [
            new OA\Parameter(name: "category_id", in: "query", required: false, description: "Filter by category ID", schema: new OA\Schema(type: "integer", example: 1)),
            new OA\Parameter(name: "search", in: "query", required: false, description: "Search by product name or description", schema: new OA\Schema(type: "string", example: "headphones")),
            new OA\Parameter(name: "page", in: "query", required: false, description: "Page number for pagination", schema: new OA\Schema(type: "integer", example: 1)),
            new OA\Parameter(name: "per_page", in: "query", required: false, description: "Items per page", schema: new OA\Schema(type: "integer", example: 15)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Paginated product list with metadata",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Product")),
                    new OA\Property(property: "meta", type: "object", properties: [
                        new OA\Property(property: "current_page", type: "integer", example: 1),
                        new OA\Property(property: "last_page", type: "integer", example: 5),
                        new OA\Property(property: "per_page", type: "integer", example: 15),
                        new OA\Property(property: "total", type: "integer", example: 68),
                        new OA\Property(property: "from", type: "integer", example: 1),
                        new OA\Property(property: "to", type: "integer", example: 15),
                    ]),
                    new OA\Property(property: "links", type: "object", properties: [
                        new OA\Property(property: "first", type: "string", example: "http://localhost:8000/api/products?page=1"),
                        new OA\Property(property: "last", type: "string", example: "http://localhost:8000/api/products?page=5"),
                        new OA\Property(property: "prev", type: "string|null", example: null),
                        new OA\Property(property: "next", type: "string", example: "http://localhost:8000/api/products?page=2"),
                    ]),
                ])
            ),
            new OA\Response(response: 400, description: "Invalid parameters"),
        ]
    )]
    public function index(Request $request)
    {
        // Validate pagination parameters
        $perPage = min((int) $request->get('per_page', 15), 100);
        if ($perPage < 1) $perPage = 15;

        // Build query with active products
        $query = Product::where('is_active', true);

        // Apply category filter if provided
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', (int) $request->category_id);
        }

        // Apply search filter if provided (search name and description)
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        // Get paginated results with sorting by newest first
        $products = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Transform product data for API response
        $data = $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => (float) $product->price,
                'stock' => (int) $product->stock,
                'image_url' => $product->image_url,
                'category' => $product->category->name ?? 'Uncategorized',
                'category_id' => $product->category_id,
                'is_active' => (bool) $product->is_active,
            ];
        });

        // Return response with pagination metadata
        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'last_page' => $products->lastPage(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ],
            'links' => [
                'first' => $products->url(1),
                'last' => $products->url($products->lastPage()),
                'prev' => $products->previousPageUrl(),
                'next' => $products->nextPageUrl(),
            ],
        ]);
    }

    // Retrieve single product by ID with full details
    #[OA\Get(
        path: "/products/{id}",
        tags: ["Products"],
        summary: "Get a single product by ID",
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "Product ID", schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Product detail with full information",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "data", ref: "#/components/schemas/Product"),
                ])
            ),
            new OA\Response(response: 404, description: "Product not found"),
        ]
    )]
    public function show($id)
    {
        // Find product by ID or fail with 404 if not found
        $product = Product::findOrFail($id);

        // Transform product data for response
        return response()->json([
            'data' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => (float) $product->price,
                'stock' => (int) $product->stock,
                'image_url' => $product->image_url,
                'category' => $product->category->name ?? 'Uncategorized',
                'category_id' => $product->category_id,
                'is_active' => (bool) $product->is_active,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ],
        ]);
    }
}

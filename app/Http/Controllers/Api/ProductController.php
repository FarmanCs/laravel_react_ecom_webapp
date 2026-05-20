<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ProductController extends Controller
{
    #[OA\Get(
        path: "/products",
        tags: ["Products"],
        summary: "List all active products",
        parameters: [
            new OA\Parameter(name: "category_id", in: "query", required: false, description: "Filter by category ID", schema: new OA\Schema(type: "integer", example: 1)),
            new OA\Parameter(name: "search", in: "query", required: false, description: "Search by product name", schema: new OA\Schema(type: "string", example: "headphones")),
            new OA\Parameter(name: "page", in: "query", required: false, description: "Page number", schema: new OA\Schema(type: "integer", example: 1)),
            new OA\Parameter(name: "per_page", in: "query", required: false, description: "Items per page (15, 30, 60, 90)", schema: new OA\Schema(type: "integer", example: 15)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Paginated product list",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Product")),
                    new OA\Property(property: "meta", type: "object", properties: [
                        new OA\Property(property: "current_page", type: "integer", example: 1),
                        new OA\Property(property: "last_page", type: "integer", example: 2),
                        new OA\Property(property: "per_page", type: "integer", example: 15),
                        new OA\Property(property: "total", type: "integer", example: 22),
                        new OA\Property(property: "from", type: "integer", example: 1),
                        new OA\Property(property: "to", type: "integer", example: 15),
                    ]),
                ])
            ),
        ]
    )]
    public function index(Request $request)
    {
        // Validate and sanitize per_page parameter
        $perPage = $request->input('per_page', 15);
        $allowedPerPage = [15, 30, 60, 90];

        // If per_page is not in allowed values, default to 15
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 15;
        }

        $query = Product::active();

        // Apply category filter
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Use Laravel's built-in paginate method
        $products = $query->paginate($perPage);

        // Transform the products data
        $result = [];
        foreach ($products as $product) {
            $result[] = [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'stock' => $product->stock,
                'image_url' => $product->image_url,
                'category' => $product->category->name,
                'category_id' => $product->category_id,
            ];
        }

        return response()->json([
            'data' => $result,
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ],
        ]);
    }

    #[OA\Get(
        path: "/products/{id}",
        tags: ["Products"],
        summary: "Get a single product by ID",
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "Product ID", schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(response: 200, description: "Product detail", content: new OA\JsonContent(ref: "#/components/schemas/ProductDetail")),
            new OA\Response(response: 404, description: "Product not found"),
        ]
    )]
    public function show($id)
    {
        // Find the product or throw  default 404 error if not found
        $product = Product::findOrFail($id);

        // Transform product data to include category name and other details which is not important to return to the user
        $result = [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'price' => $product->price,
            'stock' => $product->stock,
            'image_url' => $product->image_url,
            'category' => $product->category->name,
            'category_id' => $product->category_id,
        ];

        return response()->json([
            'data' => $result,
        ]);
    }
}

# the main bug and eror in the app was cors and csrf mismatch problem,

## the backend store the token and the middelware look for the seesson not token so that accure the conflect.

laravel internaly use token based auth with api.php file with its built in config/cors.php file and used seesson based auth with web.php routes so we should follow the larave conventions used token with sactum middleware aand remove the costum middelware and let the laravel handle it, if we want to use our middleare then it must be the last middleware to use by calling append() methond on middelware

the root case for this was our custome middleware with prepend method call, so and the satefullapi(),and we didn't use the laravel built in config/cors.php file to handle the cors and csrf problem internally by laravel so that cuase the csrf and cors error.

# best approce to use the config/cors.php file to handle the cors and csrf by larvel and remove the middleware from the boot/app.

then it will work perfectly and somethely becuase the laravel sanctum handle the both the statefull and stateless so inthe code we store the token which is stateless so the cors.php auto handle that by set the middleware in the api.php grooupt with auth:sanctum and the seeson base auth i mean the statfull auth would handle in web.php by defult its laravel convention so we have to use it.

//app.php
->withMiddleware(function (Middleware $middleware): void {}) should empty for cors handling.

# $middleware->statefulApi();

here is the root of the error when we use the ngot an error "CSRF token mismatch" when we use the api routes with sanctum and cors, this is because the api routes are not stateful by default, so we need to make them stateful to use the sanctum and cors together, this will allow the api routes to use the session and cookies, which is required for the sanctum to work properly with cors, if we don't make the api routes stateful, then the sanctum will not be able to use the session and cookies, which will cause the "CSRF token mismatch" error when we try to use the api routes with sanctum and cors together, so we need to make the api routes stateful to avoid this error and to use the sanctum and cors together properly.

# ->middleware->append(\App\Http\Middleware\Cors::class)

# here we need to append not prepend the cors middleware to the end of the middleware stack.

this is because the cors middleware needs to be executed after all the other middleware, if we append it before any other middleware, then it will not work properly and we will get the "CSRF token mismatch" error when we try to use the api routes with sanctum and cors together, so we need to append the cors middleware to the end of the middleware stack to avoid this error and to use the sanctum and cors together properly.

# if we use the laravel built config/cors.php file,

then we don't need to append the cors middleware here, because the laravel will automatically register the cors middleware for us, but if we want to use our own custom cors middleware, then we need to append it here to make it work properly with sanctum and cors together. which i suppose the best way to do it, because it will give us more control over the cors configuration and how it works with sanctum and cors together, so we can customize the cors middleware to fit our needs and to work properly with sanctum and cors together, so we need to append the cors middleware here if we want to use our own custom cors middleware, otherwise we can just use the laravel built config/cors.php file and it will work properly with sanctum and cors together without any additional configuration.

# Checkout controller was not handling the acid insetion into the different table

## hard coded checkout no payment integration at themoment

so for the checkout and cars we need to implement the db:transection to handle the any kind of error for kean and net transection.
also set.

# CartController Missing user filter in index()

Description:
The index() method fetches the first active cart without filtering by the authenticated user. This allows any logged‑in user to see another user’s cart (the first active cart in the database).

## Steps to Reproduce:

Log in as user1@ikonicdev.com and add items to the cart.
Log in as user2@ikonicdev.com and call GET /api/cart.
The response shows user1’s cart instead of an empty cart.

### before

$cart = Cart::where('status', 'active')
->with('items.product')
->first().

### After

$cart = Cart::where('user_id', $request->user()->id)
->where('status', 'active')
->with('items.product')
->first();

# CartController Missing ownership check in updateItem() and removeItem()

The methods updateItem() and removeItem() accept any itemId and do not verify that the cart item belongs to the current user. An attacker could modify or delete any cart item in the system by guessing its ID.

## solution

$item = CartItem::findOrFail($itemId);
if ($item->cart->user_id !== $request->user()->id) {
return response()->json(['message' => 'Unauthorized'], 403);
}

# OrderController Missing user filter in index()

The index() method returns all orders from all users. This leaks sensitive order information.

## Before

$orders = Order::with('items')->orderBy('created_at', 'desc')->get().

## After

$orders = Order::where('user_id', $request->user()->id)
->with('items')
->orderBy('created_at', 'desc')
->get();

# OrderController Missing ownership check in show()

The show() method returns any order by ID without verifying that the order belongs to the current user. An attacker can view any order in the system.

## solution

$order = Order::with('items')->findOrFail($id);
if ($order->user_id !== $request->user()->id) {
return response()->json(['message' => 'Unauthorized'], 403);
}

# CheckoutController No database transaction or stock validation

The process() method creates an order and marks the cart as checked_out without wrapping the operations in a transaction. If an error occurs between order creation and cart update, the database becomes inconsistent. Also, stock is never validated or decremented, allowing overselling.

# set proper dynomic pagination

$perPage = min((int) $request->get('per_page', 15), 100);
$products = $query->paginate($perPage);

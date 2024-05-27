<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\EthereumLoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class EthereumLoginController extends Controller
{
    public function login(EthereumLoginRequest $request): Response
    {
        $request->authenticate();

        $address = strtolower($request->string('address'));

        $user = User::firstOrCreate(
            ['address' => $address],
        );

        Auth::login($user);

        $request->session()->regenerateToken();

        return response()->noContent();
    }

    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->noContent();
    }
}

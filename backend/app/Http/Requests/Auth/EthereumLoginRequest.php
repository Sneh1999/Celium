<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use kornrunner\Keccak;
use Elliptic\EC;
use Illuminate\Support\Str;

class EthereumLoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'message' => ['required', 'string'],
            'signature' => ['required', 'string', 'regex:/^0x([A-Fa-f0-9]{130})$/'],
            'address' => ['required', 'string', 'regex:/0x[a-fA-F0-9]{40}/m'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $nonce = csrf_token();

        if (!$nonce) {
            throw ValidationException::withMessages(['signature' => 'Nonce not found.']);
        }

        $message = $this->string('message');
        $signature = $this->string('signature');
        $address = $this->string('address');

        $hash = Keccak::hash(sprintf("\x19Ethereum Signed Message:\n%s%s", strlen($message), $message), 256);
        $sign   = ['r' => substr($signature, 2, 64), 's' => substr($signature, 66, 64)];
        $recid  = ord(hex2bin(substr($signature, 130, 2))) - 27;

        if ($recid != ($recid & 1)) {
            throw ValidationException::withMessages(['signature' => 'Invalid signature.']);
        }

        $pubkey = (new EC('secp256k1'))->recoverPubKey($hash, $sign, $recid);

        $signature_valid = hash_equals(
            (string) Str::of($address)->after('0x')->lower(),
            substr(Keccak::hash(substr(hex2bin($pubkey->encode('hex')), 1), 256), 24)
        );

        if (!$signature_valid) {
            throw ValidationException::withMessages(['signature' => 'Invalid signature.']);
        }
    }
}

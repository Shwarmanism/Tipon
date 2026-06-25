<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FallbackController extends Controller
{
    public function endpoint()
    {
        return view('errors.404');
    }
}
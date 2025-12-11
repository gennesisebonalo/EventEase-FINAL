<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'fullname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'education_level' => 'required|string|in:Elementary,High School,Senior High School,College',
            'department' => 'nullable|required_if:education_level,College|string|in:BSIT,BSHM,BSENTREP,EDUCATION',
        ]);

        $user = User::create([
            'name' => $request->fullname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'education_level' => $request->education_level,
            'department' => $request->education_level === 'College' ? $request->department : null,
        ]);

        return response()->json(['success' => true, 'message' => 'User registered successfully'], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        return response()->json([
            'message' => 'Login successful!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_pic' => $user->profile_pic,
                'bio' => $user->bio,
                'education_level' => $user->education_level,
                'section' => $user->section,
                'strand' => $user->strand,
                'department' => $user->department,
            ]
        ], 200);
    }

    public function updateProfile(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'profile_pic' => 'nullable|string', // Base64 images can be large, but we'll allow them
            'bio' => 'nullable|string|max:1000',
            'education_level' => 'nullable|string|in:Basic Education,College',
            'section' => 'nullable|string|max:255',
            'strand' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'rfid_card_id' => 'nullable|string|max:255|unique:users,rfid_card_id,' . $user->id . ',id',
            'printed_id' => 'nullable|string|max:255|unique:users,printed_id,' . $user->id . ',id',
        ]);

        $updateData = [
            'name' => $request->name,
            'profile_pic' => $request->profile_pic,
            'bio' => $request->bio,
            'education_level' => $request->education_level,
            'section' => $request->section,
            'strand' => $request->strand,
            'department' => $request->department,
        ];

        // Only update RFID card ID if provided (this is the chip ID from RFID reader)
        if ($request->has('rfid_card_id')) {
            $updateData['rfid_card_id'] = $request->rfid_card_id;
        }

        // Only update printed ID if provided (this is the printed number on the card)
        if ($request->has('printed_id')) {
            $updateData['printed_id'] = $request->printed_id;
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_pic' => $user->profile_pic,
                'bio' => $user->bio,
                'education_level' => $user->education_level,
                'section' => $user->section,
                'strand' => $user->strand,
                'department' => $user->department,
                'rfid_card_id' => $user->rfid_card_id,
                'printed_id' => $user->printed_id,
            ]
        ], 200);
    }
} 
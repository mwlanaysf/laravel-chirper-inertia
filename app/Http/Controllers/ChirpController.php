<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Chirp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ChirpController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Chirps/Index', [
            'chirps' => Chirp::with('user:id,name')->latest()->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'message' => 'required|string|max:255',
        'media' => 'nullable|file|mimes:jpg,jpeg,png,mp4,mp3|max:20480',
    ]);

    $mediaPath = null;

    if ($request->hasFile('media')) {
        // Simpan file media ke folder public storage
        $mediaPath = $request->file('media')->store('chirp_media', 'public');
    }

    // Simpan chirp dengan path media (jika ada)
    $request->user()->chirps()->create([
        'message' => $request->input('message'),
        'media_path' => $mediaPath,
    ]);

    return redirect(route('chirps.index'));
}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
{
    $chirp = Chirp::findOrFail($id);

    $request->validate([
        'message' => 'required|string|max:255',
        'media' => 'nullable|mimes:jpg,jpeg,png,mp4,mp3|max:10240', // Misalnya
    ]);

    // Lakukan update pada chirp
    $chirp->update([
        'message' => $request->input('message'),
        'media' => $request->file('media') ? $request->file('media')->store('media') : null,
    ]);


    // Update pesan
    $chirp->message = $request->input('message');

    // Jika ada media yang diupload, ganti media lama
    if ($request->hasFile('media')) {
        // Hapus media lama
        if ($chirp->media_path) {
            Storage::delete($chirp->media_path);
        }

        // Simpan media baru
        $path = $request->file('media')->store('chirps'); // Simpan di folder 'chirps'

        // Update path media di database
        $chirp->media_path = $path;
    }

    $chirp->save();

    return redirect()->route('chirps.index')->with('success', 'Chirp updated successfully');
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Chirp $chirp): RedirectResponse
    {
        Gate::authorize('delete', $chirp);
        $chirp->delete();
        return redirect(route('chirps.index'));
    }
}

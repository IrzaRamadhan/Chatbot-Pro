<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TemplateController extends Controller
{
    public function index()
    {
        $templates = Template::orderBy('created_at', 'desc')->get();
        
        return Inertia::render('templates/index', [
            'templates' => $templates,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $template = Template::create($validated);

        return redirect()->back()->with('success', 'Template created successfully');
    }

    public function update(Request $request, Template $template)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return redirect()->back()->with('success', 'Template updated successfully');
    }

    public function destroy(Template $template)
    {
        $template->delete();

        return redirect()->back()->with('success', 'Template deleted successfully');
    }
}

import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface Template {
    id: number;
    name: string;
    category: string;
    content: string;
    variables: string[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    templates: Template[];
}

export default function TemplatesIndex({ templates }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    const { data, setData, post, put, reset, errors } = useForm({
        name: '',
        category: 'greeting',
        content: '',
        variables: [] as string[],
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingTemplate) {
            put(route('templates.update', editingTemplate.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                    setEditingTemplate(null);
                },
            });
        } else {
            post(route('templates.store'), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (template: Template) => {
        setEditingTemplate(template);
        setData({
            name: template.name,
            category: template.category,
            content: template.content,
            variables: template.variables || [],
            is_active: template.is_active,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this template?')) {
            router.delete(route('templates.destroy', id));
        }
    };

    const handleNewTemplate = () => {
        setEditingTemplate(null);
        reset();
        setIsDialogOpen(true);
    };

    return (
        <AppLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Template Management
                    </h2>
                    <Button onClick={handleNewTemplate}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Template
                    </Button>
                </div>
            }
        >
            <Head title="Templates" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chatbot Message Templates</CardTitle>
                            <CardDescription>
                                Manage reusable message templates for your chatbot. Use variables like {'{'}name{'}'}, {'{'}order_id{'}'} for dynamic content.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Content Preview</TableHead>
                                        <TableHead>Variables</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {templates.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-gray-500">
                                                No templates found. Create your first template!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        templates.map((template) => (
                                            <TableRow key={template.id}>
                                                <TableCell className="font-medium">{template.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {template.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-md truncate text-sm text-gray-600">
                                                    {template.content}
                                                </TableCell>
                                                <TableCell>
                                                    {template.variables && template.variables.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {template.variables.map((v, i) => (
                                                                <Badge key={i} variant="secondary" className="text-xs">
                                                                    {'{' + v + '}'}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No variables</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                                                        {template.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(template)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(template.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
                        <DialogDescription>
                            {editingTemplate
                                ? 'Update the template details below.'
                                : 'Fill in the details to create a new message template.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Template Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Welcome Message"
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="greeting">Greeting</SelectItem>
                                        <SelectItem value="follow_up">Follow Up</SelectItem>
                                        <SelectItem value="closing">Closing</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="content">Message Content</Label>
                                <Textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Hello {name}, welcome to our store!"
                                    rows={5}
                                />
                                <p className="text-xs text-gray-500">
                                    Use {'{'}variable_name{'}'} for dynamic content
                                </p>
                                {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="variables">Variables (comma-separated)</Label>
                                <Input
                                    id="variables"
                                    value={data.variables.join(', ')}
                                    onChange={(e) =>
                                        setData(
                                            'variables',
                                            e.target.value.split(',').map((v) => v.trim()),
                                        )
                                    }
                                    placeholder="name, order_id, product_name"
                                />
                                <p className="text-xs text-gray-500">
                                    List variables used in your template
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active
                                </Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">{editingTemplate ? 'Update' : 'Create'} Template</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Project {
  id: number;
  name: string;
  description: string;
}

const initialProjects: Project[] = [
  { id: 1, name: "AI Research", description: "AI-based campus analytics" },
  { id: 2, name: "Placement Portal", description: "Student placement management" },
];

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!form.name) return;
    setProjects([...projects, { id: Date.now(), ...form }]);
    setForm({ name: "", description: "" });
  };

  const handleEdit = (project: Project) => {
    setEditId(project.id);
    setForm({ name: project.name, description: project.description });
  };

  const handleUpdate = () => {
    setProjects(projects.map(p => (p.id === editId ? { ...p, ...form } : p)));
    setEditId(null);
    setForm({ name: "", description: "" });
  };

  const handleDelete = (id: number) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Projects (CRUD Example)</h2>
      <div className="flex gap-2 mb-4">
        <Input name="name" placeholder="Project Name" value={form.name} onChange={handleChange} />
        <Input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        {editId ? (
          <Button onClick={handleUpdate} className="bg-green-600 hover:bg-green-700">Update</Button>
        ) : (
          <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700">Add</Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map(project => (
            <TableRow key={project.id}>
              <TableCell>{project.name}</TableCell>
              <TableCell>{project.description}</TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => handleEdit(project)} className="mr-2">Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(project.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Projects;

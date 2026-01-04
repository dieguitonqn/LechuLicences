"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUser } from "@/actions/update-user"

// Define a type for the user object passed prop
type User = {
    id: string
    name: string | null
    lastName: string | null
    sector: string | null
    unit: string | null
    management: string | null
    ordinaryLicenseDays: number
    article41Days: number
    sickLeaveDays: number
    familyCareDays: number
    travelDays: number
    // other fields...
}

export function EditUserDialog({ user, canEdit }: { user: User; canEdit: boolean }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    // Simplified form management (could use zod/react-hook-form full schema)
    const [formData, setFormData] = useState({
        name: user.name || "",
        lastName: user.lastName || "",
        sector: user.sector || "",
        unit: user.unit || "",
        management: user.management || "",
        ordinaryLicenseDays: user.ordinaryLicenseDays,
        article41Days: user.article41Days,
        sickLeaveDays: user.sickLeaveDays,
        familyCareDays: user.familyCareDays,
        travelDays: user.travelDays
    })

    if (!canEdit) return null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(() => {
            updateUser({ id: user.id, ...formData })
                .then((res) => {
                    if (res.error) {
                        alert(res.error)
                    } else {
                        setOpen(false)
                        router.refresh()
                    }
                })
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Make changes to the user profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lastName" className="text-right">Last Name</Label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="management" className="text-right">Management</Label>
                        <Input id="management" name="management" value={formData.management} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right">Unit</Label>
                        <Input id="unit" name="unit" value={formData.unit} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sector" className="text-right">Sector</Label>
                        <Input id="sector" name="sector" value={formData.sector} onChange={handleChange} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ordinaryLicenseDays" className="text-right">Ord. Lic.</Label>
                        <Input type="number" id="ordinaryLicenseDays" name="ordinaryLicenseDays" value={formData.ordinaryLicenseDays} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sickLeaveDays" className="text-right">Sick Leave</Label>
                        <Input type="number" id="sickLeaveDays" name="sickLeaveDays" value={formData.sickLeaveDays} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="article41Days" className="text-right">Art 41</Label>
                        <Input type="number" id="article41Days" name="article41Days" value={formData.article41Days} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="familyCareDays" className="text-right">Fam Care</Label>
                        <Input type="number" id="familyCareDays" name="familyCareDays" value={formData.familyCareDays} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="travelDays" className="text-right">Travel</Label>
                        <Input type="number" id="travelDays" name="travelDays" value={formData.travelDays} onChange={handleChange} className="col-span-3" />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}

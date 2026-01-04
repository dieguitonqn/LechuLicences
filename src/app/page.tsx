import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Navbar } from "@/components/navbar"
import { redirect } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { EditUserDialog } from "@/components/edit-user-dialog"
import { User } from "next-auth"

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/auth/signin")
  }

  // Fetch current user details for RBAC
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, manageableSector: true }
  })

  // Basic RBAC flags
  const isAdmin = currentUser?.role === "ADMIN"
  const isManager = currentUser?.role === "MANAGER"
  const managerSector = currentUser?.manageableSector

  const page = Number(searchParams.page) || 1
  const limit = 10
  const skip = (page - 1) * limit

  const query = typeof searchParams.query === 'string' ? searchParams.query : ""

  const whereClause: any = {}

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
      { unit: { contains: query, mode: "insensitive" } },
      { management: { contains: query, mode: "insensitive" } },
    ]
  }

  const [users, totalUsers] = await Promise.all([
    db.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.user.count({ where: whereClause }),
  ])

  const totalPages = Math.ceil(totalUsers / limit)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">User Management</h1>
          <div className="flex gap-2">
            {/* Add actions here like Create User if needed */}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <div className="flex gap-4 mt-4">
              <form className="flex-1 flex gap-2">
                <Input
                  name="query"
                  placeholder="Search by name, unit..."
                  defaultValue={query}
                  className="max-w-xs"
                />
                <Button type="submit">Search</Button>
              </form>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Management</TableHead>
                    <TableHead className="text-right">Ord. Lic.</TableHead>
                    <TableHead className="text-right">Sick Leave</TableHead>
                    <TableHead className="text-right">Family Care</TableHead>
                    <TableHead className="text-right">Travel</TableHead>
                    <TableHead className="text-right">Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user: any) => {
                      // Calculate permission for this specific row
                      const canEdit = isAdmin || (isManager && managerSector && user.management === managerSector)

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name} {user.lastName}
                          </TableCell>
                          <TableCell>{user.sector || "-"}</TableCell>
                          <TableCell>{user.unit || "-"}</TableCell>
                          <TableCell>{user.management || "-"}</TableCell>
                          <TableCell className="text-right">{user.ordinaryLicenseDays}</TableCell>
                          <TableCell className="text-right">{user.sickLeaveDays}</TableCell>
                          <TableCell className="text-right">{user.familyCareDays}</TableCell>
                          <TableCell className="text-right">{user.travelDays}</TableCell>
                          <TableCell className="text-right">{user.role}</TableCell>
                          <TableCell className="text-right">
                            {canEdit ? (
                              <EditUserDialog user={user} canEdit={canEdit} />
                            ) : <span className="text-gray-400 text-xs italic">View Only</span>}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  asChild
                >
                  {page > 1 ? (
                    <Link href={`/?page=${page - 1}&query=${query}`}>Previous</Link>
                  ) : <span>Previous</span>}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  asChild
                >
                  {page < totalPages ? (
                    <Link href={`/?page=${page + 1}&query=${query}`}>Next</Link>
                  ) : <span>Next</span>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

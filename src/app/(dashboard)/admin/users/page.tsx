import { requirePatron, ROLE_LABELS } from "@/lib/rbac";
import { getUsers } from "@/lib/actions/admin";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { UserRoleSelect } from "./user-role-select";

export const metadata = {
  title: "Gestion des utilisateurs",
};

export default async function AdminUsersPage() {
  const session = await requirePatron();
  const users = await getUsers();

  const staffCount = users.filter(
    (u) => u.role !== "client"
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les rôles et permissions des utilisateurs.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">← Retour</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length - staffCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Discord ID</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-right">Factures</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt=""
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {(user.displayName || user.username).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {user.displayName || user.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.discordId}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "client" ? "outline" : "default"}
                        className={
                          user.role === "superadmin"
                            ? "bg-purple-500/20 text-purple-400"
                            : user.role === "patron"
                            ? "bg-amber-500/20 text-amber-400"
                            : undefined
                        }
                      >
                        {ROLE_LABELS[user.role] || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{user._count.invoices}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(user.createdAt), "d MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserRoleSelect
                        user={user}
                        currentUserId={session.user.id}
                        currentUserRole={session.user.role}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

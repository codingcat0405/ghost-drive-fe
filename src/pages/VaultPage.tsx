import { useMemo, useState } from "react";
import { Lock, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VaultHeader from "@/components/vault/vault-header";
import VaultGrid from "@/components/vault/vault-grid";
import CreateSecretDialog from "@/components/vault/create-secret-dialog";
import ViewSecretDialog from "@/components/vault/view-secret-dialog";
import DeleteSecretDialog from "@/components/vault/delete-secret-dialog";
import DecryptPinDialog from "@/components/DecryptPinDialog";
import useUserStore from "@/store/user";
import ghostDriveApi from "@/apis/ghost-drive-api";
import { toast } from "sonner";
import cryptoUtils from "@/utils/crypto";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useDebounce } from "use-debounce";

interface Secret {
  id: number;
  title: string;
  username?: string;
  createdAt: string;
  category: string;
  password: string;
}

const getCategoryName = (category: number) => {
  switch (category) {
    case 1:
      return "password";
    case 2:
      return "api-key";
    case 3:
      return "token";
    case -1:
      return "other";
    default:
      return "other";
  }
};

export default function VaultPage() {
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 1000);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(null);
  const [actionType, setActionType] = useState<"view" | "delete" | "create">(
    "view"
  );
  const {
    data: secretData = {
      contents: [],
      currentPage: 0,
      perPage: 0,
      totalPage: 0,
      totalElements: 0,
    },
    refetch: refetchSecrets,
  } = useQuery({
    queryKey: ["vault.list", debouncedSearchQuery],
    queryFn: async ({ queryKey }) => {
      const data = await ghostDriveApi.vault.list({
        page: 1,
        limit: 10,
        q: queryKey[1] as string,
      });
      return data;
    },
  });
  const secrets = useMemo(() => {
    if (!secretData) return [];
    return secretData.contents.map((item) => ({
      id: item.id,
      title: item.title,
      username: item.username,
      category: getCategoryName(item.category),
      createdAt: moment(item.createdAt).format("DD/MM/YYYY HH:mm:ss"),
      password: item.password,
    }));
  }, [secretData]);

  const handleCreateSecret = async (data: {
    title: string;
    username?: string;
    password: string;
    category: number;
  }) => {
    try {
      setIsLoading(true);
      if (!user.aesKeyPlain) {
        toast.error("Failed to encrypt password!");
        return;
      }
      const encryptedPassword = await cryptoUtils.encryptText(
        data.password,
        user.aesKeyPlain
      );
      data.password = encryptedPassword;
      console.log(data);
      await ghostDriveApi.vault.create(data);
      await refetchSecrets();
      setIsLoading(false);
      toast.success("Secret created successfully");
      setCreateDialogOpen(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast.error("Failed to create secret");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSecret = async (secret: Secret) => {
    setSelectedSecret(secret);
    if (!user.aesKeyPlain) {
      setActionType("view");
      setPinDialogOpen(true);
      return;
    }
    try {
      const decryptedPassword = await cryptoUtils.decryptText(
        secret.password,
        user.aesKeyPlain
      );
      setSelectedSecret({
        ...secret,
        password: decryptedPassword,
      });
      setActionType("view");
      setViewDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to decrypt password");
    }
  };

  const handleDeleteSecret = (secret: Secret) => {
    setSelectedSecret(secret);
    if (!user.aesKeyPlain) {
      setActionType("delete");
      setPinDialogOpen(true);
      return;
    }
    setActionType("delete");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      if (!selectedSecret?.id) {
        toast.error("Secret not found");
        return;
      }
      await ghostDriveApi.vault.delete(selectedSecret.id);
      await refetchSecrets();
      toast.success("Secret deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast.error("Failed to delete secret");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <VaultHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Secret Vault
                </h1>
                <p className="text-muted-foreground">
                  Securely store and manage your sensitive credentials with
                  end-to-end encryption
                </p>
              </div>
              <Button
                disabled={isLoading}
                onClick={() => {
                  if (!user.aesKeyPlain) {
                    setActionType("create");
                    setPinDialogOpen(true);
                    return;
                  }
                  setActionType("create");
                  setCreateDialogOpen(true);
                }}
                className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Add Secret
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search secrets by title or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border text-foreground"
            />
          </div>

          {/* Empty State or Grid */}
          {secrets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 rounded-lg border border-border bg-card">
              <Lock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Secrets Found
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "Start by adding your first secret credential."}
              </p>
              {!searchQuery && (
                <Button
                  disabled={isLoading}
                  onClick={() => {
                    if (!user.aesKeyPlain) {
                      setActionType("create");
                      setPinDialogOpen(true);
                      return;
                    }
                    setActionType("create");
                    setCreateDialogOpen(true);
                  }}
                  className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Secret
                </Button>
              )}
            </div>
          ) : (
            <VaultGrid
              secrets={secrets}
              onView={handleViewSecret}
              onDelete={handleDeleteSecret}
            />
          )}
        </div>
      </main>

      {/* Dialogs */}
      <CreateSecretDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateSecret}
        isLoading={isLoading}
      />

      <DecryptPinDialog
        open={pinDialogOpen}
        setOpen={setPinDialogOpen}
        onSuccess={async () => {
          if (actionType === "create") {
            setCreateDialogOpen(true);
          } else if (actionType === "view") {
            try {
              if (!user.aesKeyPlain || !selectedSecret?.password) {
                return;
              }
              const decryptedPassword = await cryptoUtils.decryptText(
                selectedSecret.password,
                user.aesKeyPlain
              );
              setSelectedSecret({
                ...selectedSecret,
                password: decryptedPassword,
              });
              setViewDialogOpen(true);
            } catch (error) {
              console.error(error);
              toast.error("Failed to decrypt password");
            }
          } else if (actionType === "delete") {
            setDeleteDialogOpen(true);
          }
        }}
      />

      <ViewSecretDialog
        isOpen={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        secret={selectedSecret}
      />

      <DeleteSecretDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        secret={selectedSecret}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

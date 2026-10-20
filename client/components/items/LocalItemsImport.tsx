import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Item } from "@shared/api";
import { isPhoto } from "@shared/profile";
import { useMe } from "@/lib/auth";
import { ITEMS_KEY, saveNewItem } from "@/lib/items";
import { createLocalList } from "@/lib/local-store";

/** Items posted before Supabase was connected, kept in this browser. */
const localItems = createLocalList<Item>("common-shed:items");
let running = false;

/**
 * Copies the items this browser still holds into Supabase, once, as the
 * signed-in neighbor's items. Each item leaves the browser only after it is
 * saved, so a failed copy is retried at the next visit.
 */
export function LocalItemsImport() {
  const { userId, profileId } = useMe();
  const queryClient = useQueryClient();

  useEffect(() => {
    const pending = localItems.read();
    if (running || pending.length === 0) return;
    running = true;

    (async () => {
      let copied = 0;
      for (const item of pending) {
        const ok = await saveNewItem(
          { userId, profileId },
          {
            isGift: item.kind === "gift",
            photos: item.photos.flatMap((photo) =>
              isPhoto(photo.src) ? [photo.src] : [],
            ),
            title: item.title,
            description: item.description,
            condition: item.condition,
          },
          { status: item.status, createdAt: item.createdAt },
        );
        if (!ok) continue;
        copied += 1;
        localItems.write(
          localItems.read().filter((local) => local.id !== item.id),
        );
      }
      running = false;
      if (copied > 0) {
        await queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
        toast.success(
          copied === 1
            ? "Votre objet est maintenant visible par vos voisins"
            : `Vos ${copied} objets sont maintenant visibles par vos voisins`,
        );
      }
      if (copied < pending.length) {
        toast.error("Certains objets n’ont pas pu être copiés", {
          description:
            "Ils restent sur ce téléphone ; nouvel essai à la prochaine visite.",
        });
      }
    })();
  }, [userId, profileId, queryClient]);

  return null;
}

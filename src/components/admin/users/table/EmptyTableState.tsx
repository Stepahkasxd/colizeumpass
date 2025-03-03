
import { Users as UsersIcon } from "lucide-react";

export const EmptyTableState = () => {
  return (
    <tr>
      <td colSpan={12} className="py-20 px-4 text-center text-muted-foreground">
        <div className="flex flex-col items-center justify-center space-y-2">
          <UsersIcon className="h-8 w-8 text-[#e4d079]/50" />
          <p>Пользователи не найдены</p>
        </div>
      </td>
    </tr>
  );
};

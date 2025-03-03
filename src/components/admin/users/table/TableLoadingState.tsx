
export const TableLoadingState = () => {
  return (
    <tr>
      <td colSpan={12} className="py-20 px-4 text-center text-muted-foreground">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-[#e4d079]/30 border-t-[#e4d079] rounded-full"></div>
          <p>Загрузка пользователей...</p>
        </div>
      </td>
    </tr>
  );
};

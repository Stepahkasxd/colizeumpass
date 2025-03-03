
export const UserTableHeader = () => {
  return (
    <thead>
      <tr className="border-b bg-[#e4d079]/5">
        <th className="w-[120px] py-3 px-4 text-left font-medium admin-text">ID</th>
        <th className="w-[180px] py-3 px-4 text-left font-medium admin-text">Имя</th>
        <th className="w-[140px] py-3 px-4 text-left font-medium admin-text">Телефон</th>
        <th className="w-[100px] py-3 px-4 text-left font-medium admin-text">Статус</th>
        <th className="w-[100px] py-3 px-4 text-left font-medium admin-text">Пропуск</th>
        <th className="w-[80px] py-3 px-4 text-left font-medium admin-text">Уровень</th>
        <th className="w-[100px] py-3 px-4 text-left font-medium admin-text">Очки прогресса</th>
        <th className="w-[100px] py-3 px-4 text-left font-medium admin-text">Свободные очки</th>
        <th className="w-[120px] py-3 px-4 text-left font-medium admin-text">Состояние</th>
        <th className="w-[100px] py-3 px-4 text-left font-medium admin-text">Роль</th>
        <th className="w-[160px] py-3 px-4 text-left font-medium admin-text">Дата регистрации</th>
        <th className="w-[150px] py-3 px-4 text-left font-medium admin-text">Действия</th>
      </tr>
    </thead>
  );
};

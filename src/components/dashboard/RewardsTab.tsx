
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Gift } from "lucide-react";

export const RewardsTab = () => {
  const mockRewards = [
    {
      id: 1,
      name: "Бесплатный час игры",
      status: "available",
      earnedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Скидка 10% на следующую покупку",
      status: "claimed",
      earnedAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Доступные награды</h2>
        <div className="grid gap-4">
          {mockRewards.filter(r => r.status === "available").map((reward) => (
            <Card key={reward.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{reward.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    Получено: {new Date(reward.earnedAt).toLocaleDateString()}
                  </div>
                  <Button>
                    <Gift className="mr-2 h-4 w-4" />
                    Забрать
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">История наград</h2>
        <ScrollArea className="h-[300px] rounded-md border">
          <div className="p-4 space-y-4">
            {mockRewards.filter(r => r.status === "claimed").map((reward) => (
              <Card key={reward.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{reward.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    Получено: {new Date(reward.earnedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

import { Clock } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";

interface ComingSoonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function ComingSoonDialog({
  open,
  onOpenChange,
  title = "Coming Soon",
  description = "We're polishing this experience for launch. You'll be the first to know when it goes live.",
}: ComingSoonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm items-center text-center">
        <DialogOverlay />
        <DialogHeader className="items-center">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center border border-primary/20 mb-2">
            <Icon as={Clock} size={28} className="text-primary" />
          </View>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <DialogClose asChild>
            <Button className="w-full h-14 rounded-full bg-primary">
              <Text className="text-primary-foreground font-bold text-lg">Got it</Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

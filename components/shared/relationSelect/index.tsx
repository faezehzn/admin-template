import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetRelationQuery } from "@/stores/relationApi";

type Props = {
  model: string;
  value?: string | number;
  onChange?: (val: string) => void;
};

export function RelationSelect({ model, value, onChange }: Props) {
  const { data = [], isLoading } = useGetRelationQuery(model);

  return (
    <Select value={value?.toString()} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={isLoading ? "Loading..." : `Select ${model}`}
        />
      </SelectTrigger>

      <SelectContent>
        {data.length ? data.map((item) => (
          <SelectItem key={item.id} value={String(item.id)}>
            {item.label}
          </SelectItem>
        )): <SelectItem value="__empty" disabled>{"No item found"}</SelectItem>}
      </SelectContent>
    </Select>
  );
}

import { useMutation,useQueryClient } from "@tanstack/react-query";

import {createGroup} from "../lib/api.js";
import { toast } from "react-hot-toast"; 
const useCreateGroup = () => {
    const queryClient = useQueryClient();
      const { mutate, isPending, error } = useMutation({
        mutationFn: createGroup,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["Mygroups"] })
          toast.success("group created succesfully")
        },
        onError : () =>{
          toast.error("Group creation failed");
        }
      });
      return { error, isPending, createGroupMutation: mutate };
}
export default useCreateGroup;
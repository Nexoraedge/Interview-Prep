import React from "react";
import { Input } from "./ui/input";
import { Controller, FieldValues , Path , Control } from "react-hook-form";
import { FormItem , FormLabel , FormDescription , FormMessage  , FormControl} from "./ui/form";

interface FormFeildProps <T extends FieldValues> {
   control: Control<T>;
   name: Path<T>;
   label: string;
   placeholder?: string;
   type?: 'text'| 'email' |'password' |'file';
}

const Formfeild = ({control , name , label   , placeholder , type = "text"} :FormFeildProps<T>) => (
  <Controller
  control={control}
    name={name}
    render={({field})=>(
        <FormItem>
        <FormLabel className="label">{label}</FormLabel>
        <FormControl>
          
          <Input type={type} className="input" placeholder={placeholder} {...field} />
        </FormControl>
        
        <FormMessage />
      </FormItem>
    )}
  />
);
export default Formfeild;

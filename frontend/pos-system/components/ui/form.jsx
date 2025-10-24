// "use client";

// import * as React from "react";
// import { Slot } from "@radix-ui/react-slot";
// import {
//   Controller,
//   FormProvider,
//   useFormContext,
// } from "react-hook-form";

// import { cn } from "./utils";
// import { Label } from "./label";

// function Form({ ...props }) {
//   return <FormProvider {...props} />;
// }

// function FormFieldContext({ ...props }) {
//   return React.createContext(props);
// }

// function FormField({ ...props }) {
//   return (
//     <FormFieldContext.Provider value={{ name: props.name }}>
//       <Controller {...props} />
//     </FormFieldContext.Provider>
//   );
// }

// function useFormField() {
//   const fieldContext = React.useContext(FormFieldContext);
//   const itemContext = React.useContext(FormItemContext);
//   const { getFieldState, formState } = useFormContext();

//   const fieldState = getFieldState(fieldContext.name, formState);

//   if (!fieldContext) {
//     throw new Error("useFormField should be used within <FormField>");
//   }

//   const { id } = itemContext;

//   return {
//     id,
//     name: fieldContext.name,
//     formItemId: `${id}-form-item`,
//     formDescriptionId: `${id}-form-item-description`,
//     formMessageId: `${id}-form-item-message`,
//     ...fieldState,
//   };
// }

// function FormItemContext({ ...props }) {
//   return React.createContext(props);
// }

// function FormItem({
//   className,
//   ...props
// }) {
//   const id = React.useId();

//   return (
//     <FormItemContext.Provider value={{ id }}>
//       <div className={cn("space-y-2", className)} {...props} />
//     </FormItemContext.Provider>
//   );
// }

// function FormLabel({
//   className,
//   ...props
// }) {
//   const { error, formItemId } = useFormField();

//   return (
//     <Label
//       className={cn(error && "text-destructive", className)}
//       htmlFor={formItemId}
//       {...props}
//     />
//   );
// }

// function FormControl({ ...props }) {
//   const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

//   return (
//     <Slot
//       id={formItemId}
//       aria-describedby={
//         !error
//           ? `${formDescriptionId}`
//           : `${formDescriptionId} ${formMessageId}`
//       }
//       aria-invalid={!!error}
//       {...props}
//     />
//   );
// }

// function FormDescription({
//   className,
//   ...props
// }) {
//   const { formDescriptionId } = useFormField();

//   return (
//     <p
//       id={formDescriptionId}
//       className={cn("text-muted-foreground text-[0.8rem]", className)}
//       {...props}
//     />
//   );
// }

// function FormMessage({
//   className,
//   children,
//   ...props
// }) {
//   const { error, formMessageId } = useFormField();
//   const body = error ? String(error?.message) : children;

//   if (!body) {
//     return null;
//   }

//   return (
//     <p
//       id={formMessageId}
//       className={cn("text-destructive font-medium text-[0.8rem]", className)}
//       {...props}
//     >
//       {body}
//     </p>
//   );
// }

// export {
//   useFormField,
//   Form,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormDescription,
//   FormMessage,
//   FormField,
// };

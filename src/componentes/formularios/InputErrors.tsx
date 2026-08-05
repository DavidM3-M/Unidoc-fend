type Props = {
  errors: { [key: string]: { message?: string } };
  name: string;
};

const InputErrors = ({ errors, name }: Props) => {
  return (
    <>
      {errors[name]?.message && (
        <p className="text-red-500 text-xs font-semibold mt-2 ml-1">
          {errors[name]?.message}
        </p>
      )}
    </>
  );
};

export default InputErrors;

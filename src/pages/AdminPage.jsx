import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { problemSchema } from "../utils/problemSchema"; // your zod schema file
import { z } from "zod";

const AdminPage = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "easy",
      tags: [],
      visibleTestCases: [{ input: "", output: "", explanation: "" }],
      hiddenTestCases: [{ input: "", output: "" }],
      starterCode: [
        { language: "cpp", initialCode: "" },
        { language: "java", initialCode: "" },
        { language: "python", initialCode: "" },
      ],
      referenceSolution: [
        { language: "cpp", completeCode: "" },
        { language: "java", completeCode: "" },
        { language: "python", completeCode: "" },
      ],
      constraints: { timeLimit: "", memoryLimit: "" },
    },
  });

  // Field arrays
  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({
    control,
    name: "visibleTestCases",
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({
    control,
    name: "hiddenTestCases",
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Problems</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <input
            {...register("title")}
            placeholder="Problem Title"
            className="w-full p-2 border rounded"
          />
          {errors.title && (
            <p className="text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Visible Test Cases */}
        <div className="p-4 border rounded bg-gray-800 text-white">
          <h2 className="font-bold">Visible Test Cases</h2>
          {visibleFields.map((field, index) => (
            <div key={field.id} className="mb-4">
              <input
                {...register(`visibleTestCases.${index}.input`)}
                placeholder="Input"
                className="w-full p-2 border rounded mb-2 text-black"
              />
              <input
                {...register(`visibleTestCases.${index}.output`)}
                placeholder="Output"
                className="w-full p-2 border rounded mb-2 text-black"
              />
              <input
                {...register(`visibleTestCases.${index}.explanation`)}
                placeholder="Explanation"
                className="w-full p-2 border rounded mb-2 text-black"
              />
              <button
                type="button"
                className="bg-red-500 px-2 py-1 rounded text-white"
                onClick={() => removeVisible(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="bg-blue-500 px-3 py-1 rounded text-white"
            onClick={() =>
              appendVisible({ input: "", output: "", explanation: "" })
            }
          >
            Add Visible Test Case
          </button>
        </div>

        {/* Hidden Test Cases */}
        <div className="p-4 border rounded bg-gray-800 text-white">
          <h2 className="font-bold">Hidden Test Cases</h2>
          {hiddenFields.map((field, index) => (
            <div key={field.id} className="mb-4">
              <input
                {...register(`hiddenTestCases.${index}.input`)}
                placeholder="Input"
                className="w-full p-2 border rounded mb-2 text-black"
              />
              <input
                {...register(`hiddenTestCases.${index}.output`)}
                placeholder="Output"
                className="w-full p-2 border rounded mb-2 text-black"
              />
              <button
                type="button"
                className="bg-red-500 px-2 py-1 rounded text-white"
                onClick={() => removeHidden(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="bg-blue-500 px-3 py-1 rounded text-white"
            onClick={() => appendHidden({ input: "", output: "" })}
          >
            Add Hidden Test Case
          </button>
        </div>
        {/* Starter Code */}
        <div>
          <h2 className="text-xl font-bold">Starter Code</h2>
          {["cpp", "java", "python"].map((lang, idx) => (
            <div key={lang} className="mt-2">
              <label className="block">{lang.toUpperCase()}</label>
              <textarea
                {...register(`starterCode.${idx}.initialCode`)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                placeholder={`Starter code for ${lang}`}
              />
            </div>
          ))}
        </div>

        {/* Reference Solution */}
        <div>
          <h2 className="text-xl font-bold">Reference Solution</h2>
          {["cpp", "java", "python"].map((lang, idx) => (
            <div key={lang} className="mt-2">
              <label className="block">{lang.toUpperCase()}</label>
              <textarea
                {...register(`referenceSolution.${idx}.completeCode`)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                placeholder={`Reference solution for ${lang}`}
              />
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div>
          <h2 className="text-xl font-bold">Constraints</h2>
          <input
            {...register("constraints.timeLimit")}
            placeholder="Time Limit"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 mt-2"
          />
          <input
            {...register("constraints.memoryLimit")}
            placeholder="Memory Limit"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 mt-2"
          />
        </div>

        <button
          type="submit"
          className="bg-green-500 px-4 py-2 rounded text-white"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AdminPage;

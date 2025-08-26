import { FileQuestion } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center py-32 flex-col text-center">
      <FileQuestion className="h-24 w-24 text-gray-800 mb-8 animate-pulse" />
      <h1 className="text-4xl font-bold text-black mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-600 mb-8">Oops!, Hi...</p>
    </div>
  );
};

export default NotFoundPage;

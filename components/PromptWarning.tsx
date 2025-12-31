export const PromptWarning = () => {
  return (
    <div className="bg-blue-50 border-l-4 border-black p-4 mb-6">
      <div className="flex">
        <div className="shrink-0">
          <svg
            className="h-5 w-5 text-black"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-black">
            What Can Be Animated
          </h3>
          <div className="mt-2 text-sm text-green-600">
            <p className="mb-2">
              This creates <strong>educational mathematical animations</strong>{" "}
              using Manim. Best for:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Geometric shapes and transformations</li>
              <li>Mathematical equations and formulas</li>
              <li>Graphs, charts, and plots</li>
              <li>Algorithm visualizations</li>
              <li>Physics concepts (vectors, motion)</li>
              <li>Simple text animations</li>
            </ul>

            <p className=" text-red-500 mt-3 font-medium">
              ⚠️ Cannot Generate:
            </p>
            <ul className="list-disc list-inside space-y-1 text-red-500">
              <li>❌ Realistic images or photos</li>
              <li>❌ Complex 3D scenes (simple 3D only)</li>
              <li>❌ Character animations or cartoons</li>
              <li>❌ Video editing or effects</li>
              <li>❌ Audio or music</li>
              <li>❌ Real-world simulations</li>
            </ul>

            <p className="mt-3 text-xs text-black">
              💡 <strong>Tip : </strong> Be specific! Instead of &quot;animate
              something cool&quot;, try &quot;show a rotating square that
              changes color from blue to red&quot;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

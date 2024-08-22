import { FeatureDetails } from "./FeatureDetails";

interface FeatureRowProps {
  feature: any;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  rowRef: React.RefObject<HTMLTableRowElement>;
}

export const FeatureRow: React.FC<FeatureRowProps> = ({
  feature,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  rowRef,
}) => {
  const buttonText = isSelected ? "Show Less" : "More Info";
  const featureDescriptionClass = isSelected ? "font-semibold" : "font-normal";

  return (
    <tr
      key={feature.id}
      ref={rowRef}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`hover:bg-[var(--accent-color)] transition-colors cursor-default duration-100 w-full flex ${
        isSelected || isHovered ? "bg-[var(--accent-color)]" : "bg-white"
      }`}
    >
      <td className="py-2 whitespace-nowrap text-sm text-gray-500 flex flex-row items-start w-[64px]">
        <div className="bg-[var(--primary-color)] px-1.5 rounded-lg">
          <span className="text-white text-xs"># {feature.id}</span>
        </div>
      </td>
      <td className="py-2 whitespace-nowrap text-sm w-full">
        <div className="flex flex-row items-start justify-between w-full overflow-scroll">
          <div className="flex flex-col w-full">
            <div className="flex justify-between">
              <span className={featureDescriptionClass}>
                {feature.description}
              </span>

              {isHovered && (
                <button
                  onClick={onClick}
                  className="transition-opacity duration-200 ml-4 underline text-[var(--primary-color)] pr-2"
                >
                  {buttonText}
                </button>
              )}
            </div>
            {isSelected && (
              <div className="mt-4">
                <FeatureDetails featureId={feature.id} />
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

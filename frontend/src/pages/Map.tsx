import MainLayout from "../layout/MainLayout";
import MapView from "../components/MapView";
import colors from "../assets/colors.json";

const Map = () => {
  const header = <h2 className="text-xl font-semibold">Dive Map</h2>;

  return (
    <MainLayout header={header} scrollable={false}>
      <div
        className="flex flex-col flex-grow min-h-0 relative"
        style={{
          backgroundColor: colors.cardBackground
        }}
      >
        <div
          className="flex-grow min-h-0 rounded-x1 over-flow-hidden border"
          style={{
            borderColor: `1px solid ${colors.primaryLight}40`,
            backgroundColor: colors.cardBackground
          }}
        >
          <MapView />
        </div>
      </div>

      <div
        className="flex-none text-sm text-gray-600 text-center py-3"
        style={{
          backgroundColor: colors.cardBackground,
          borderTop: `1px solid ${colors.primaryLight}30`
        }}
      >
        Explore registered dive schools and geolocated uploads 🗺️
      </div>
    </MainLayout>
  )
};

export default Map;

export type HeroIsometricCard = {
  id: string;
  kind: "event" | "resource";
  title: string;
  subtitle: string;
  location: string;
  href: string;
  image: string;
  accentColor: string;
};

export const HERO_ISOMETRIC_CARDS: HeroIsometricCard[] = [
  {
    id: "farmers-market",
    kind: "event",
    title: "Bothell Farmers Market",
    subtitle: "Fresh produce, local makers, neighborhood booths",
    location: "Park at Bothell Landing",
    href: "/events/83cd749a-1840-474c-91d3-ca18d7c8f9a1",
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#B36A4C",
  },
  {
    id: "arts-walk",
    kind: "event",
    title: "Northshore Art Walk",
    subtitle: "Local artists, gallery openings, and live demos",
    location: "Various Downtown & Country Village Locations",
    href: "/events/e1a23d87-1d5a-44f5-b124-f390225c5d29",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2c/Bothell%2C_WA_-_Country_Village_09_-_in_front_of_Clock_Tower_Building.jpg",
    accentColor: "#8A6F5A",
  },
  {
    id: "workready",
    kind: "resource",
    title: "Cascadia College",
    subtitle: "A premier community college focused on sustainability",
    location: "18345 Campus Way NE, Bothell, WA 98011",
    href: "/resources/4cd6138d-eee4-4bea-b2d5-6a12c3b06cc9",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    accentColor: "#4B6A8A",
  },
  {
    id: "food-bank",
    kind: "resource",
    title: "Hopelink Bothell/Shoreline",
    subtitle: "Food bank and financial assistance center",
    location: "18105 102nd Ave NE, Bothell, WA 98011",
    href: "/resources/ae376f16-dd86-40a4-871d-cf2814d18918",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    accentColor: "#6F7553",
  },
  {
    id: "riverfest",
    kind: "event",
    title: "Riverfest Celebration",
    subtitle: "Paddleboard demos, salmon education, riverside activities",
    location: "Sammamish River Trail",
    href: "/events/b6d3b78a-eb65-4987-b7d9-95725e4473f5",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/7/7f/SammamishRiverviewBothellLanding.jpg",
    accentColor: "#5E7FA1",
  },
  {
    id: "garden",
    kind: "resource",
    title: "Bothell Community Hub",
    subtitle: "Free behavioral-health and community support hub",
    location: "11811 NE 195th Street, Bothell, WA 98011",
    href: "/resources/6c7e682d-b114-49ef-afbc-2fd16aca2901",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Behavioral%20Health%20Clinic%20%288054679759%29.jpg",
    accentColor: "#4F7B56",
  },
  {
    id: "culture-fest",
    kind: "resource",
    title: "Bothell Landing Park",
    subtitle: "The historic heart of Bothell, where the city meets the Sammamish River",
    location: "9919 NE 180th St, Bothell, WA 98011",
    href: "/resources/54734e3f-e2db-4e05-ada0-7765c7845da3",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/0c/Bothell_Landing_04.jpg",
    accentColor: "#A65D46",
  },
];

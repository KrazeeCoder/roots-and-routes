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
    location: "Main Street, Downtown Bothell",
    href: "/events/83cd749a-1840-474c-91d3-ca18d7c8f9a1",
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80",
    accentColor: "#B36A4C",
  },
  {
    id: "arts-walk",
    kind: "event",
    title: "Downtown Arts Walk",
    subtitle: "Gallery pop-ups, live mural painting, local music",
    location: "Bothell Landing & Main Street",
    href: "/events/e1a23d87-1d5a-44f5-b124-f390225c5d29",
    image:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80",
    accentColor: "#8A6F5A",
  },
  {
    id: "workready",
    kind: "resource",
    title: "WorkReady Bothell",
    subtitle: "Career coaching, skills labs, interview prep",
    location: "Wayne Public Golf Course Campus",
    href: "/resources/8a7ad46a-8483-4178-ac2a-319584e5dbf3",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80",
    accentColor: "#4B6A8A",
  },
  {
    id: "food-bank",
    kind: "resource",
    title: "Bothell Food Bank",
    subtitle: "Pantry support, hot meals, family essentials",
    location: "NE 181st St, Bothell",
    href: "/resources/ae376f16-dd86-40a4-871d-cf2814d18918",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
    accentColor: "#6F7553",
  },
  {
    id: "riverfest",
    kind: "event",
    title: "Sammamish River Fest",
    subtitle: "Kayaks, food trucks, youth activities",
    location: "Bothell Landing Park",
    href: "/events/b6d3b78a-eb65-4987-b7d9-95725e4473f5",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    accentColor: "#5E7FA1",
  },
  {
    id: "garden",
    kind: "resource",
    title: "Open Doors Gala",
    subtitle: "Raised beds, workshops, neighbor harvest days",
    location: "NE 180th St, Bothell",
    href: "/resources/6c7e682d-b114-49ef-afbc-2fd16aca2901",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80",
    accentColor: "#4F7B56",
  },
  {
    id: "culture-fest",
    kind: "event",
    title: "Culture Night on Main",
    subtitle: "Dance showcases, food stalls, community stories",
    location: "Main Street Plaza, Bothell",
    href: "/events/85020c2e-f8ec-4445-9e7c-dd4c2595d36e",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
    accentColor: "#A65D46",
  },
];

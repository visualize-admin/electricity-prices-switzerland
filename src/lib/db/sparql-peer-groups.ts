// Auto-generated file - do not edit manually
// Generated from SPARQL endpoint: https://test.lindas.admin.ch/query
// Run `bun bun src/lib/db/sparql-peer-groups.gen.ts` to update

export const peerGroups: Record<string, PeerGroup> = {
  "0": {
    "id": "0",
    "uri": "https://energy.ld.admin.ch/elcom/electricityprice/group/0",
    "names": {
      "de": "keine Zuteilung",
      "en": "no allocation",
      "fr": "Groupe 0",
      "it": "Gruppo 0"
    }
  },
  "1": {
    "id": "1",
    "uri": "https://energy.ld.admin.ch/elcom/electricityprice/group/1",
    "names": {
      "de": "hohe Siedlungsdichte und hohe Energiedichte",
      "en": "high population density and high energy density",
      "fr": "Groupe 1",
      "it": "Gruppo 1"
    }
  },
  "2": {
    "id": "2",
    "uri": "https://energy.ld.admin.ch/elcom/electricityprice/group/2",
    "names": {
      "de": "hohe Siedlungsdichte und tiefe Energiedichte",
      "en": "high population density and low energy density",
      "fr": "Groupe 2",
      "it": "Gruppo 2"
    }
  },
  "3": {
    "id": "3",
    "uri": "https://energy.ld.admin.ch/elcom/electricityprice/group/3",
    "names": {
      "de": "mittlere Siedlungsdichte und hohe Energiedichte",
      "en": "medium population density and high energy density",
      "fr": "Groupe 3",
      "it": "Gruppo 3"
    }
  },
  "4": {
    "id": "4",
    "uri": "https://energy.ld.admin.ch/elcom/electricityprice/group/4",
    "names": {
      "de": "mittlere Siedlungsdichte und tiefe Energiedichte",
      "en": "medium population density and low energy density",
      "fr": "Groupe 4",
      "it": "Gruppo 4"
    }
  },
  "5": {
    "id": "5",
    "uri": "https://energy.ld.admin.ch/elcom/electricityprice/group/5",
    "names": {
      "de": "Ländliches Netz und hohe Energiedichte",
      "en": "Rural network and high energy density",
      "fr": "Groupe 5",
      "it": "Gruppo 5"
    }
  },
  "6": {
    "id": "6",
    "uri": "https://energy.ld.admin.ch/elcom/electricityprice/group/6",
    "names": {
      "de": "Ländliches Netz und tiefe Energiedichte",
      "en": "Rural network and low energy density",
      "fr": "Groupe 6",
      "it": "Gruppo 6"
    }
  },
  "7": {
    "id": "7",
    "uri": "https://energy.ld.admin.ch/elcom/electricityprice/group/7",
    "names": {
      "de": "Berggebiet und hohe Energiedichte",
      "en": "Mountainous terrain and high energy density",
      "fr": "Groupe 7",
      "it": "Gruppo 7"
    }
  },
  "8": {
    "id": "8",
    "uri": "https://energy.ld.admin.ch/elcom/electricityprice/group/8",
    "names": {
      "de": "Berggebiet und tiefe Energiedichte",
      "en": "Mountainous terrain and low energy density",
      "fr": "Groupe 8",
      "it": "Gruppo 8"
    }
  },
  "9": {
    "id": "9",
    "uri": "https://energy.ld.admin.ch/elcom/electricityprice/group/9",
    "names": {
      "de": "Tourismusgebiet und hohe Energiedichte",
      "en": "Tourist area and high energy density",
      "fr": "Groupe 9",
      "it": "Gruppo 9"
    }
  },
  "10": {
    "id": "10",
    "uri": "https://energy.ld.admin.ch/elcom/electricityprice/group/10",
    "names": {
      "de": "Tourismusgebiet und tiefe Energiedichte",
      "en": "Tourist area and low energy density",
      "fr": "Groupe 10",
      "it": "Gruppo 10"
    }
  }
} as const;

type PeerGroup = {
    id: string;
    uri: string;
    names: {
        en?: string;
        de?: string;
        fr?: string;
        it?: string;
    };
};

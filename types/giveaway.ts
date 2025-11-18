export interface GiveawayEntry {
  username: string;
  comment?: string;
  timestamp?: string;
  tags?: string[];
}

export interface GiveawayCriteria {
  postUrl?: string;
  numberOfWinners: number;
  uniqueEntriesOnly: boolean;
  maxEntriesPerUser: number;
  requireTag: boolean;
  manualEntries: string[];
}

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  from?: {
    id: string;
    username: string;
  };
}

export interface Winner {
  username: string;
  entryNumber: number;
  totalEntries: number;
  entries?: GiveawayEntry[];
}

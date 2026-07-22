import { DirectoryService } from "./directory-service";
import { YESNETService } from "./yesnet-service";

export interface DirectorySearchResult {
  display_name: string;
  first_name: string;
  last_name: string;
  ynet_id: string;
  email: string;
  long_name: string;
  title: string;
  department: string;
  officeLocation: string;
  userPrincipalName: string;
  user_id?: number;
}

export class UnifiedDirectoryService {
  private directoryService: DirectoryService;
  private yesnetService: YESNETService;

  constructor() {
    this.directoryService = new DirectoryService();
    this.yesnetService = new YESNETService();
  }

  /**
   * Connects to both directory services in parallel
   */
  async connect(): Promise<void> {
    await Promise.all([
      this.directoryService.connect(),
      this.yesnetService.connect(),
    ]);
  }

  /**
   * Searches both directory services and returns combined results
   * @param terms Search terms
   * @returns Combined array of results from both services
   */
  async search(terms: string): Promise<DirectorySearchResult[]> {
    await this.connect();

    const [directoryResults, yesnetResults] = await Promise.all([
      this.directoryService.search(terms),
      this.yesnetService.search(terms),
    ]);

    return [...directoryResults, ...yesnetResults];
  }

  /**
   * Searches both directory services by email and returns combined results
   * @param email Email address to search for
   * @returns Combined array of results from both services
   */
  async searchByEmail(email: string): Promise<DirectorySearchResult[]> {
    await this.connect();

    const [directoryResults, yesnetResults] = await Promise.all([
      this.directoryService.searchByEmail(email),
      this.yesnetService.searchByEmail(email),
    ]);

    const emailResults = [...directoryResults, ...yesnetResults];
    return emailResults;

    if (emailResults.length > 0) return emailResults;

    const [directorySearchResults, yesnetSearchResults] = await Promise.all([
      this.directoryService.search(email),
      this.yesnetService.search(email),
    ]);

    return [...directorySearchResults, ...yesnetSearchResults];
  }

  /**
   * Resolves the Azure AD userPrincipalName for an email address.
   * Only an exact (case-insensitive) match on the directory mail attribute is
   * accepted -- searchByEmail uses a startsWith filter, so a loose match could
   * attach another person's UPN to the account.
   * @returns the lowercased UPN, or null when the email isn't in either tenant
   */
  async getUpnByEmail(email: string): Promise<string | null> {
    if (!email) return null;

    const results = await this.searchByEmail(email);
    const match = results.find(
      (r) => r.email && r.email.toLowerCase() === email.toLowerCase(),
    );

    return match?.userPrincipalName?.toLowerCase() ?? null;
  }

  /**
   * True once at least one tenant has a usable token. DirectoryService.connect()
   * swallows its errors, so callers that need to distinguish "nobody by that
   * name" from "Graph is unreachable" have to check this.
   */
  isConnected(): boolean {
    return this.directoryService.connected || this.yesnetService.connected;
  }

  /**
   * Get individual service instances if needed for specific operations
   */
  getDirectoryService(): DirectoryService {
    return this.directoryService;
  }

  getYESNETService(): YESNETService {
    return this.yesnetService;
  }
}

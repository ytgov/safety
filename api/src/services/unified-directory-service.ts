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

    return [...directoryResults, ...yesnetResults];
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

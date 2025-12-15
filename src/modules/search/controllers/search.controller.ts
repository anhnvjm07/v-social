import { Request, Response, NextFunction } from "express";
import { searchService } from "../services/search.service";
import { SearchType, SearchQueryParams } from "../types/search.types";

class SearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      const type = (req.query.type as SearchType) || "all";
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

      // Parse filters if provided
      let filters: any = undefined;
      if (req.query.filters) {
        try {
          filters = JSON.parse(req.query.filters as string);
        } catch (error) {
          // Ignore invalid JSON
        }
      }

      const params: SearchQueryParams = {
        q: query,
        type,
        page,
        limit,
        sortBy,
        sortOrder,
        filters,
      };

      const result = await searchService.search(
        query,
        type,
        params,
        req.user?.id
      );

      res.status(200).json({
        success: true,
        data: result.results,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();


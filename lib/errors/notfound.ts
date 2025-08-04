import { BaseError, ErrorSchema } from "./base";

interface EntityNotFoundSchema extends ErrorSchema {
  type: string;
  id: string | { [key: string]: string };
}

interface PageNotFoundSchema extends ErrorSchema {
  page: number;
  limit?: number;
  entity?: string;
  query?: { [key: string]: string };
}

export class EntityNotFound extends BaseError<EntityNotFoundSchema> {
  id!: string | { [key: string]: string };
  type!: string;
  name = "EntityNotFound";
  static statusCode = 404;

  initialize(data: EntityNotFoundSchema): void {
    this.type = data.type;
    this.id = data.id;
  }

  serialize(): EntityNotFoundSchema {
    return {
      ...super.serialize(),
      type: this.type,
      id: this.id,
    };
  }

  static construct(
    type: string,
    id: EntityNotFoundSchema["id"],
    message?: string
  ) {
    return new this(message || `${type} not found`, {
      type: type,
      id: id,
    }).toResponse();
  }

  static throw(
    type: string,
    id: EntityNotFoundSchema["id"],
    message?: string
  ): never {
    throw new this(message || `${type} not found`, {
      type: type,
      id: id,
    });
  }
}

export class PageNotFound extends BaseError<PageNotFoundSchema> {
  page!: number;
  limit?: number;
  query?: { [key: string]: string };
  name = "PageNotFound";
  static statusCode = 404;

  initialize(data: PageNotFoundSchema): void {
    this.page = data.page;
    this.limit = data.limit;
    this.query = data.query;
  }

  serialize(): PageNotFoundSchema {
    return {
      ...super.serialize(),
      page: this.page,
      limit: this.limit,
      query: this.query,
    };
  }

  static construct(
    page: number,
    entity?: string,
    {
      query,
      limit,
      message,
    }: Omit<PageNotFoundSchema, "page" | "name"> = {}
  ) {
    return new this(message || `Page ${page} out of bounds`, {
      page: page,
      query: query,
      entity: entity,
      limit: limit,
    }).toResponse();
  }

  static throw(
    page: number,
    entity?: string,
    {
      query,
      limit,
      message,
    }: Omit<PageNotFoundSchema, "page" | "name"> = {}
  ): never {
    throw new this(message || `Page ${page} out of bounds`, {
      page: page,
      query: query,
      entity: entity,
      limit: limit,
    });
  }
}

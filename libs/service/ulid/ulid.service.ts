import { Injectable } from '@nestjs/common';
import { ulid } from 'ulid';

@Injectable()
export class UlidService {
  generate(type: 'user' | 'image' | 'project'): string {
    const id = ulid();
    console.log(`[ULID][${type}] ${id}`);
    return id;
  }
}

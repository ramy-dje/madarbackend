import { Global, Module } from '@nestjs/common';
import { CoreService } from './services/core.service';
import { PaginationService } from './services/pagination.service';
import { SeoModule } from './seo.module';

@Global()
@Module({
  imports: [SeoModule],
  providers: [CoreService, PaginationService],
  exports: [CoreService, PaginationService, SeoModule],
})
export class CoreModule {}

import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContactsService } from '../services/contacts.service';
import { ZodValidationPipe } from 'src/core/pipes/zodValidation.pipe';
import { PaginationQueryValidationSchema } from 'src/core/validations/pagination-query.validation';
import { PaginationQueryInterface } from 'src/core/interfaces/pagination.interface';
import ContactFilteringInterface from '../interfaces/contacts.filtering';
import { ContactFilter_ValidationSchema } from '../validations/contact-filtering.schema';
import { PaginatedResponse } from 'src/core/interfaces/pagination.interface';
import {
  Client_ContactInterface,
  Create_ContactInterface,
} from '../interfaces/contacts.interface';
import { Create_Contact_ValidationSchema } from '../validations/create-contact.schema';
import { Update_Contact_ValidationSchema } from '../validations/update-contact.schema';
import {
  CRUDManyIDsValidationSchema,
  CRUDManyIDsValidationSchemaType,
} from 'src/core/validations/crud-many.validation';
import { AuthGuard } from 'src/app/modules/auth/guards/auth.guard';
import { AuthRole } from 'src/app/modules/auth/guards/role.guard';

@Controller('crm/contacts')
export class ContactsController {
  constructor(
    @Inject(ContactsService)
    private readonly contactsService: ContactsService,
  ) {}

  // get all CRM contacts endpoint (with pagination)
  @Get()
  @UseGuards(AuthGuard, AuthRole([], ['crm_contacts:read']))
  async get_all_contacts(
    @Query(new ZodValidationPipe(PaginationQueryValidationSchema))
    { page = 0, size = 10 }: PaginationQueryInterface,
    @Query(new ZodValidationPipe(ContactFilter_ValidationSchema))
    filters: ContactFilteringInterface,
  ): Promise<PaginatedResponse<Client_ContactInterface>> {
    // getting all the contacts with pagination
    const res = await this.contactsService.get_all_contacts(
      {
        page,
        size,
      },
      filters,
    );

    // returning the data with pagination
    return {
      data: res.data,
      page: page,
      total: res.total,
      size: res.data.length,
    };
  }

  // get a contact endpoint
  @Get(':id')
  @UseGuards(AuthGuard, AuthRole([], ['crm_contacts:read']))
  async get_contact_by_id(
    @Param('id') contact_id: string,
  ): Promise<Client_ContactInterface> {
    // getting and returning the contact
    return await this.contactsService.get_contact_by_id(contact_id);
  }

  // create a contact endpoint
  @Post()
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_contacts:read', 'crm_contacts:create']),
  )
  async create_contact(
    @Body(new ZodValidationPipe(Create_Contact_ValidationSchema))
    contact: Create_ContactInterface,
  ): Promise<string> {
    // creating and returning the created contact
    return await this.contactsService.create_contact(contact);
  }

  // update a contact by id endpoint
  @Put(':id')
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_contacts:read', 'crm_contacts:update']),
  )
  async update_contact_by_id(
    @Param('id') contact_id: string,
    @Body(new ZodValidationPipe(Update_Contact_ValidationSchema))
    contact: Partial<Create_ContactInterface>,
  ): Promise<string> {
    // updating and returning the updated contact
    return await this.contactsService.update_contact(contact_id, contact);
  }

  // delete many contacts
  @Delete('many')
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_contacts:read', 'crm_contacts:delete']),
  )
  async delete_many_contacts(
    @Body(new ZodValidationPipe(CRUDManyIDsValidationSchema))
    body: CRUDManyIDsValidationSchemaType,
  ): Promise<any> {
    return await this.contactsService.delete_many_contacts(body.ids);
  }

  // delete a contact endpoint
  @Delete(':id')
  @UseGuards(
    AuthGuard,
    AuthRole([], ['crm_contacts:read', 'crm_contacts:delete']),
  )
  async delete_contact_by_id(@Param('id') contact_id: string): Promise<string> {
    // deleting and returning a message
    return await this.contactsService.delete_contact(contact_id);
  }
}

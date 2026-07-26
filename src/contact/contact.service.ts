import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schema/contact.schema';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  create(dto: CreateContactDto) {
    return this.contactModel.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
      subject: dto.subject?.trim() || '',
      message: dto.message.trim(),
    });
  }

  findAll() {
    return this.contactModel.find().sort({ createdAt: -1 }).exec();
  }

  async markAsRead(id: string) {
    const contact = await this.contactModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );
    if (!contact) {
      throw new NotFoundException('Contact message not found');
    }
    return contact;
  }
}

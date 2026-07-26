import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto';

@ApiTags('Vote')
@Controller('vote')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  @ApiOperation({
    summary:
      'Start a vote payment for a contestant (public). Returns Flutterwave URL when voting is open.',
  })
  create(@Body() createVoteDto: CreateVoteDto) {
    return this.voteService.create(createVoteDto);
  }

  @Get('winners')
  @ApiOperation({
    summary:
      'Get top contestant per category. Confirmed winners when voting is stopped.',
  })
  getWinners() {
    return this.voteService.getWinners();
  }
}

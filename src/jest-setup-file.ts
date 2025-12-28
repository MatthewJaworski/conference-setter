import 'reflect-metadata';
import { Logger } from '@nestjs/common';

// Disable the NestJS logger while running tests
Logger.overrideLogger(false);

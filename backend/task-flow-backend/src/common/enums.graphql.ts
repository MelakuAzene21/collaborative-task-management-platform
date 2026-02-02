import { registerEnumType } from '@nestjs/graphql';
import { Role, TaskStatus, Priority } from './types';

// Register enums with GraphQL
registerEnumType(Role, {
  name: 'Role',
  description: 'User role in the system',
});

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'Status of a task',
});

registerEnumType(Priority, {
  name: 'Priority',
  description: 'Priority level of a task',
});

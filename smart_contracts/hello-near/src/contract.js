import {
  NearBindgen,
  call,
  view,
  near,
  initialize
} from "near-sdk-js";

@NearBindgen({})
export class HelloNear {
  greeting = 'Hello';

  @view({})
  get_greeting() {
    return this.greeting;
  }

  @call({})
  set_greeting({ greeting }) {
    near.log(`Saving greeting ${greeting}`);
    this.greeting = greeting;
  }
}
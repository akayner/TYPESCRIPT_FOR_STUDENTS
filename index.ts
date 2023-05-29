interface ObserverHandlers {
  next?: (value: RequestType) => void;
  error?: (error: unknown) => void;
  complete?: () => void;
}

class Observer {
  private isUnsubscribed: boolean = false;
  private _unsubscribe?: () => void;

  constructor(private handlers: ObserverHandlers) {}

  next(value: RequestType) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: unknown) {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete() {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe() {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

class Observable {
  private _subscribe: (observer: Observer) => () => void;

  constructor(subscribe: (observer: Observer) => () => void) {
    this._subscribe = subscribe;
  }

  static from(values: RequestType[]): Observable {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(obs: ObserverHandlers): { unsubscribe: () => void } {
    const observer = new Observer(obs);

    observer.unsubscribe = this._subscribe(observer);

    return {
      unsubscribe: () => {
        observer.unsubscribe();
      },
    };
  }
}

enum MethodTypes {
  HTTP_POST_METHOD = "POST",
  HTTP_GET_METHOD = "GET",
}

enum StatusTypes {
  HTTP_STATUS_OK = 200,
  HTTP_STATUS_INTERNAL_SERVER_ERROR = 500,
}

interface User {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleated: boolean;
}

const userMock: User = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleated: false,
};

interface RequestType {
  method: MethodTypes;
  host: string;
  path: string;
  body?: User;
  params: { [key: string]: string };
}

const requestsMock: RequestType[] = [
  {
    method: MethodTypes.HTTP_POST_METHOD,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: MethodTypes.HTTP_GET_METHOD,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest = (_request: RequestType) => {
  // handling of request
  return { status: StatusTypes.HTTP_STATUS_OK };
};

const handleError = (_error: unknown) => {
  // handling of error
  return { status: StatusTypes.HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();

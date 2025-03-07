import 'webpack/module';

declare namespace NodeJS {
  interface Module {
    hot?: webpack.Hot;
  }
}
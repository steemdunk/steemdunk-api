import {MigrationInterface, QueryRunner} from "typeorm";

export class Initialize1550179678882 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "bot_support" ("id" SERIAL NOT NULL, "last_vote" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '"1970-01-01T00:00:00.000Z"', "ban_expiry" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '"1970-01-01T00:00:00.000Z"', "enabled" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_0e2c9bc64aad436761dbb50ae97" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d592e192baf2993a903eb4b5e9" ON "bot_support" ("last_vote") `);
        await queryRunner.query(`CREATE INDEX "IDX_a90edc462cb0db149aefc86e5f" ON "bot_support" ("ban_expiry") `);
        await queryRunner.query(`CREATE INDEX "IDX_244c56f6dac4f711a6380357bc" ON "bot_support" ("enabled") `);
        await queryRunner.query(`CREATE INDEX "IDX_dd659b047dc7bf6074cad768ba" ON "bot_support" ("last_vote", "ban_expiry") `);
        await queryRunner.query(`CREATE INDEX "IDX_f50ead1bd1fe807bbd501ffe49" ON "bot_support" ("last_vote", "ban_expiry", "enabled") `);
        await queryRunner.query(`CREATE TABLE "premium" ("id" SERIAL NOT NULL, "plan" integer NOT NULL, "expiry" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_111eb81823538c77bcb9e4e0cab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "claim_rewards" boolean NOT NULL DEFAULT false, "global_vote_pause" boolean NOT NULL DEFAULT false, "admin" boolean NOT NULL DEFAULT false, "disabled" boolean NOT NULL DEFAULT false, "premiumId" integer NOT NULL, "botSupportId" integer NOT NULL, CONSTRAINT "REL_ef274bef6402f0cef3ade4e05b" UNIQUE ("premiumId"), CONSTRAINT "REL_8a95f4f216783ee3faa88cd38d" UNIQUE ("botSupportId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_78a916df40e02a9deb1c4b75ed" ON "user" ("username") `);
        await queryRunner.query(`CREATE TABLE "author" ("id" SERIAL NOT NULL, "author" character varying NOT NULL, "vote_weight" integer NOT NULL, "vote_delay" integer NOT NULL, "max_daily_votes" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_5a0e79799d372fe56f2f3fa6871" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_645811deaaaa772f9e6c2a4b92" ON "author" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9f79b5a1b561f817e127cc4a42" ON "author" ("author") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ff819f22a95f072930c5cfa6cd" ON "author" ("userId", "author") `);
        await queryRunner.query(`CREATE TABLE "session" ("session" character varying NOT NULL, "expiry" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_695a9133593d3aeadb2392c9133" PRIMARY KEY ("session"))`);
        await queryRunner.query(`CREATE TABLE "settings" ("id" boolean NOT NULL DEFAULT true, "last_claimed_rewards" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "CHK_6daa3a6b1c8ec307a8745fb50a" CHECK (id = true), CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vote_log" ("id" SERIAL NOT NULL, "author" character varying NOT NULL, "permlink" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "weight" integer NOT NULL, "status" integer NOT NULL, "voterId" integer NOT NULL, CONSTRAINT "PK_568b9f90f19c0021690f61d80bf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_94c7bbb3e3da5590530c588ab0" ON "vote_log" ("voterId", "author", "permlink") `);
        await queryRunner.query(`CREATE TABLE "vote_task" ("id" SERIAL NOT NULL, "author" character varying NOT NULL, "permlink" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "weight" integer NOT NULL, "voterId" integer, CONSTRAINT "PK_301b474490801250ff8bcaf04cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4610a231bcfc32b026066d3ed6" ON "vote_task" ("timestamp") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0602c860c6340c63e6057c8e3c" ON "vote_task" ("voterId", "author", "permlink") `);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_ef274bef6402f0cef3ade4e05b7" FOREIGN KEY ("premiumId") REFERENCES "premium"("id")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_8a95f4f216783ee3faa88cd38d5" FOREIGN KEY ("botSupportId") REFERENCES "bot_support"("id")`);
        await queryRunner.query(`ALTER TABLE "author" ADD CONSTRAINT "FK_645811deaaaa772f9e6c2a4b927" FOREIGN KEY ("userId") REFERENCES "user"("id")`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id")`);
        await queryRunner.query(`ALTER TABLE "vote_log" ADD CONSTRAINT "FK_ed28309f17c58dee4de1b924f07" FOREIGN KEY ("voterId") REFERENCES "user"("id")`);
        await queryRunner.query(`ALTER TABLE "vote_task" ADD CONSTRAINT "FK_9711f168006014707112b1e2349" FOREIGN KEY ("voterId") REFERENCES "user"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "vote_task" DROP CONSTRAINT "FK_9711f168006014707112b1e2349"`);
        await queryRunner.query(`ALTER TABLE "vote_log" DROP CONSTRAINT "FK_ed28309f17c58dee4de1b924f07"`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`);
        await queryRunner.query(`ALTER TABLE "author" DROP CONSTRAINT "FK_645811deaaaa772f9e6c2a4b927"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_8a95f4f216783ee3faa88cd38d5"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_ef274bef6402f0cef3ade4e05b7"`);
        await queryRunner.query(`DROP INDEX "IDX_0602c860c6340c63e6057c8e3c"`);
        await queryRunner.query(`DROP INDEX "IDX_4610a231bcfc32b026066d3ed6"`);
        await queryRunner.query(`DROP TABLE "vote_task"`);
        await queryRunner.query(`DROP INDEX "IDX_94c7bbb3e3da5590530c588ab0"`);
        await queryRunner.query(`DROP TABLE "vote_log"`);
        await queryRunner.query(`DROP TABLE "settings"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP INDEX "IDX_ff819f22a95f072930c5cfa6cd"`);
        await queryRunner.query(`DROP INDEX "IDX_9f79b5a1b561f817e127cc4a42"`);
        await queryRunner.query(`DROP INDEX "IDX_645811deaaaa772f9e6c2a4b92"`);
        await queryRunner.query(`DROP TABLE "author"`);
        await queryRunner.query(`DROP INDEX "IDX_78a916df40e02a9deb1c4b75ed"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "premium"`);
        await queryRunner.query(`DROP INDEX "IDX_f50ead1bd1fe807bbd501ffe49"`);
        await queryRunner.query(`DROP INDEX "IDX_dd659b047dc7bf6074cad768ba"`);
        await queryRunner.query(`DROP INDEX "IDX_244c56f6dac4f711a6380357bc"`);
        await queryRunner.query(`DROP INDEX "IDX_a90edc462cb0db149aefc86e5f"`);
        await queryRunner.query(`DROP INDEX "IDX_d592e192baf2993a903eb4b5e9"`);
        await queryRunner.query(`DROP TABLE "bot_support"`);
    }

}

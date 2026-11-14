using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WebAPISalo.Migrations
{
    /// <inheritdoc />
    public partial class AddChatMessagesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tblChatMessages",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    ChatId = table.Column<long>(type: "bigint", nullable: false),
                    FileUrl = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ReplyToMessageId = table.Column<long>(type: "bigint", nullable: true),
                    IsEdited = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblChatMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tblChatMessages_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tblChatMessages_tblChatMessages_ReplyToMessageId",
                        column: x => x.ReplyToMessageId,
                        principalTable: "tblChatMessages",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_tblChatMessages_tblChats_ChatId",
                        column: x => x.ChatId,
                        principalTable: "tblChats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tblChatMessages_ChatId",
                table: "tblChatMessages",
                column: "ChatId");

            migrationBuilder.CreateIndex(
                name: "IX_tblChatMessages_ReplyToMessageId",
                table: "tblChatMessages",
                column: "ReplyToMessageId");

            migrationBuilder.CreateIndex(
                name: "IX_tblChatMessages_UserId",
                table: "tblChatMessages",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblChatMessages");
        }
    }
}
